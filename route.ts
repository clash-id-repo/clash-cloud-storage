import { NextResponse } from 'next/server';
import type { FileItem } from '@/types/file';
import { headers } from 'next/headers';
import storageConfig from '@/config/storage.json';

const BASE_API = "https://www.linkbox.to/api";

// Rate limiting configuration
const RATE_LIMIT = 1000;
const RATE_WINDOW = 60 * 60 * 1000;

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function getClientIP(request: Request): string {
  const headersList = headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIP = headersList.get('x-real-ip');
  
  if (forwardedFor) {
    const ips = forwardedFor.split(',');
    return ips[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return '127.0.0.1';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);
  
  if (!record) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_WINDOW
    });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetTime: now + RATE_WINDOW };
  }
  
  if (now > record.resetTime) {
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + RATE_WINDOW
    });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetTime: now + RATE_WINDOW };
  }
  
  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetTime: record.resetTime };
  }
  
  record.count += 1;
  rateLimitStore.set(ip, record);
  return { allowed: true, remaining: RATE_LIMIT - record.count, resetTime: record.resetTime };
}

interface LoginResponse {
  token: string;
  nickname: string;
  uid: number;
  userInfo: {
    size_cap: number;
    size_curr: number;
  };
}

async function loginToAccount(email: string, password: string): Promise<LoginResponse> {
  const params = new URLSearchParams({
    email,
    pwd: password,
    platform: 'web',
    pf: 'web',
    lan: 'en'
  });

  const response = await fetch(`${BASE_API}/user/login_email?${params}`);
  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  return data.data;
}

async function getFileList(token: string, pid: string = "0", filterSearch: string = "") {
  const params = new URLSearchParams({
    sortField: 'utime',
    sortAsc: '0',
    pageNo: '1',
    pageSize: '9999',
    pid,
    name: filterSearch,
    token,
    platform: 'web',
    pf: 'web',
    lan: 'en'
  });

  const response = await fetch(`${BASE_API}/file/my_file_list/web?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch files');
  }

  const data = await response.json();
  return data.data;
}

async function fetchDriveData(driveName: string, account: { email: string; password: string }, pid: string, filterSearch: string) {
  try {
    console.log(`Fetching data for ${driveName}...`);
    const loginData = await loginToAccount(account.email, account.password);
    const fileData = await getFileList(loginData.token, pid, filterSearch);

    return {
      files: fileData.list.map((file: any) => ({
        ...file,
        driveName,
        driveToken: loginData.token,
        id: `${driveName}-${file.id}`
      })),
      storage: {
        used: Number(loginData.userInfo.size_curr),
        total: Number(loginData.userInfo.size_cap),
        nickname: loginData.nickname
      },
      token: {
        token: loginData.token,
        nickname: loginData.nickname,
        uid: loginData.uid
      }
    };
  } catch (error) {
    console.error(`Error fetching ${driveName}:`, error);
    return {
      files: [],
      storage: { used: 0, total: 0, nickname: 'Error' },
      token: null
    };
  }
}

export async function GET(request: Request) {
  try {
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded',
          resetTime: new Date(rateLimit.resetTime).toISOString()
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          }
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const filterSearch = searchParams.get('search') || '';
    const pid = searchParams.get('pid') || '0';

    const drivePromises = Object.entries(storageConfig).map(([driveName, account]) => 
      fetchDriveData(driveName, account, pid, filterSearch)
    );

    const driveResults = await Promise.all(drivePromises);

    const allFiles: FileItem[] = [];
    let totalUsed = 0;
    let totalSize = 0;
    const driveStats: Record<string, { used: number; total: number; nickname: string }> = {};
    const tokens: Record<string, { token: string; nickname: string; uid: number }> = {};

    driveResults.forEach((result, index) => {
      const driveName = Object.keys(storageConfig)[index];
      allFiles.push(...result.files);
      totalUsed += result.storage.used;
      totalSize += result.storage.total;
      driveStats[driveName] = result.storage;
      if (result.token) {
        tokens[driveName] = result.token;
      }
    });

    allFiles.sort((a, b) => b.utime - a.utime);

    return NextResponse.json({
      success: true,
      data: {
        list: allFiles,
        storage: {
          total: totalSize,
          used: totalUsed,
          drives: driveStats
        },
        tokens
      }
    }, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'X-RateLimit-Reset': rateLimit.resetTime.toString(),
      }
    });
  } catch (error) {
    console.error('Files fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
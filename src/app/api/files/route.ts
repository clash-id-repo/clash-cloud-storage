import { NextResponse } from 'next/server';
import type { FileItem } from '@/types/file';
import { headers } from 'next/headers';
import storageConfig from '@/config/storage.json';

const BASE_API = "https://www.linkbox.to/api";

function getClientIP(): string {
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

async function loginToAccount(email: string, password: string, clientIP: string) {
  const params = new URLSearchParams({
    email,
    pwd: password,
    platform: 'web',
    pf: 'web',
    lan: 'en'
  });

  const response = await fetch(`${BASE_API}/user/login_email?${params}`, {
    headers: {
      'X-Forwarded-For': clientIP,
      'X-Real-IP': clientIP
    }
  });
  
  if (!response.ok) {
    throw new Error('Login failed');
  }

  const data = await response.json();
  return data.data;
}

async function getFileList(token: string, pid: string = "0", filterSearch: string = "", clientIP: string) {
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

  const response = await fetch(`${BASE_API}/file/my_file_list/web?${params}`, {
    cache: 'no-store',
    headers: {
      'X-Forwarded-For': clientIP,
      'X-Real-IP': clientIP
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch files');
  }

  const data = await response.json();
  return data.data;
}

async function fetchDriveData(driveName: string, account: { email: string; password: string }, pid: string, filterSearch: string, clientIP: string) {
  try {
    console.log(`Fetching data for ${driveName}...`);
    const loginData = await loginToAccount(account.email, account.password, clientIP);
    const fileData = await getFileList(loginData.token, pid, filterSearch, clientIP);

    return {
      files: fileData.list.map((file: any) => ({
        ...file,
        driveName,
        driveToken: loginData.token,
        id: file.type === 'dir' ? `${file.id}` : file.item_id
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
    const clientIP = getClientIP();
    const { searchParams } = new URL(request.url);
    const filterSearch = searchParams.get('search') || '';
    const pid = searchParams.get('pid') || '0';

    // Fetch all drives in parallel
    const drivePromises = Object.entries(storageConfig).map(([driveName, account]) => 
      fetchDriveData(driveName, account, pid, filterSearch, clientIP)
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

    // Sort files by modification time
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
    });
  } catch (error) {
    console.error('Files fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
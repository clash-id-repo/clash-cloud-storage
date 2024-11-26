import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import storageConfig from '@/config/storage.json';
import type { StorageConfig, StorageAccount } from '@/types/storage';

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
    cache: 'no-store',
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

async function fetchDriveStorage(driveName: string, account: StorageAccount, clientIP: string) {
  try {
    const loginData = await loginToAccount(account.email, account.password, clientIP);
    
    const driveUsed = Number(loginData.userInfo.size_curr);
    const driveTotal = Number(loginData.userInfo.size_cap);

    return {
      used: driveUsed,
      total: driveTotal,
      nickname: loginData.userInfo.nickname
    };
  } catch (error) {
    console.error(`Error fetching ${driveName}:`, error);
    return {
      used: 0,
      total: 0,
      nickname: 'Error'
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const drive = searchParams.get('drive');
  const config = storageConfig as StorageConfig;
  const clientIP = getClientIP();
  
  // If no drive specified, return all accounts storage info
  if (!drive) {
    try {
      // Fetch all drives in parallel
      const allStorageInfo = await Promise.all(
        Object.entries(config).map(async ([driveName, account]) => {
          try {
            const driveStorage = await fetchDriveStorage(driveName, account, clientIP);
            return {
              drive: driveName,
              ...driveStorage
            };
          } catch (error) {
            return {
              drive: driveName,
              error: 'Failed to fetch storage info'
            };
          }
        })
      );
      
      return NextResponse.json({ success: true, data: allStorageInfo });
    } catch (error) {
      return NextResponse.json({ success: false, error: 'Failed to fetch storage information' }, { status: 500 });
    }
  }

  // If drive is specified, fetch single drive storage info
  if (!(drive in config)) {
    return NextResponse.json({ success: false, error: 'Drive not found' }, { status: 404 });
  }

  try {
    const driveStorage = await fetchDriveStorage(drive, config[drive], clientIP);
    return NextResponse.json({ success: true, data: driveStorage });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch storage information' }, { status: 500 });
  }
}
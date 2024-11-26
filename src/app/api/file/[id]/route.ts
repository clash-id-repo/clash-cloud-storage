import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const BASE_API = "https://www.linkbox.to/api";

interface FileDetailResponse {
  id: string;
  name: string;
  size: number;
  type: string;
  ctime: number;
  utime: number;
  desc: string;
  user: {
    nickname: string;
    avatar: string;
  };
}

async function getFileDetails(itemId: string): Promise<FileDetailResponse | null> {
  const headersList = headers();
  const clientIp = headersList.get('x-forwarded-for') || '127.0.0.1';

  const params = new URLSearchParams({
    itemId,
    needUser: '1',
    needTpInfo: '1',
    isVip: 'true',
    verc: '15004001',
    platform: 'android',
    pf: 'android',
    lan: 'en'
  });

  try {
    const response = await fetch(`${BASE_API}/file/detail?${params}`, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36 Edg/129.0.0.0',
        'X-Forwarded-For': clientIp
      }
    });

    if (!response.ok) {
      throw new Error('Failed to get file details');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error getting file details:', error);
    return null;
  }
}


async function getFileLink(itemId: string): Promise<string | null> {
  const params = new URLSearchParams({
    pid: '0',
    itemIds: itemId,
    dirIds: '',
    expireTs: '-1',
    isVip: 'true',
    verc: '15004001',
    platform: 'android',
    pf: 'android',
    lan: 'en'
  });

  try {
    const response = await fetch(`${BASE_API}/file/share_out?${params}`);
    if (!response.ok) {
      throw new Error('Failed to get file link');
    }

    const data = await response.json();
    const shareData = data.data;
    
    return `${shareData.shareDomain}/f/${shareData.shareToken}`;
  } catch (error) {
    console.error('Error getting file link:', error);
    return null;
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const fileId = params.id;
    const [fileDetails] = await Promise.all([
      getFileDetails(fileId)
    ]);

    if (!fileDetails) {
      return NextResponse.json(
        { success: false, error: 'Failed to get file details' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...fileDetails
      }
    });
  } catch (error) {
    console.error('File details error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
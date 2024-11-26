export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum allowed duration for hobby plan

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

const BASE_API = "https://www.linkbox.to/api";

// Helper function to encode filename for content-disposition
function encodeFilename(filename: string): string {
  const sanitized = filename
    .replace(/'/g, "'")  // Replace smart quotes with regular quotes
    .replace(/"/g, '')   // Remove double quotes
    .replace(/[^\x20-\x7E]/g, '_'); // Replace non-ASCII chars with underscore
  
  // URI encode the filename and escape quotes
  return encodeURIComponent(sanitized)
    .replace(/['()]/g, escape) // Escape parentheses and quotes
    .replace(/\*/g, '%2A');    // Replace asterisk with encoded version
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Starting download for item:', params.id);
    
    // Get file details first
    const fileResponse = await fetch(`${BASE_API}/file/detail?itemId=${params.id}&needUser=1&needTpInfo=1&platform=web&pf=web&lan=en`, {
      signal: AbortSignal.timeout(30000) // 30 second timeout for metadata
    });
    
    if (!fileResponse.ok) {
      console.error('File details fetch failed:', {
        status: fileResponse.status,
        statusText: fileResponse.statusText
      });
      return NextResponse.json(
        { success: false, error: `Failed to get file details: ${fileResponse.status} ${fileResponse.statusText}` },
        { status: fileResponse.status }
      );
    }

    const fileData = await fileResponse.json();
    console.log('File details received:', {
      name: fileData.data?.itemInfo?.name,
      size: fileData.data?.itemInfo?.size,
      hasUrl: !!fileData.data?.itemInfo?.url
    });
    
    const downloadUrl = fileData.data?.itemInfo?.url;
    if (!downloadUrl) {
      console.error('No download URL in response');
      return NextResponse.json(
        { success: false, error: 'No download URL available' },
        { status: 400 }
      );
    }

    // Handle range requests for chunked downloading
    const rangeHeader = headers().get('range');
    const downloadOptions: RequestInit = {
      signal: AbortSignal.timeout(240000), // 4 minute timeout
    };

    if (rangeHeader) {
      console.log('Range request received:', rangeHeader);
      downloadOptions.headers = { range: rangeHeader };
    }

    // Stream the download
    console.log('Starting file stream from URL:', downloadUrl);
    const response = await fetch(downloadUrl, downloadOptions);
    
    if (!response.ok && response.status !== 206) {
      console.error('File stream fetch failed:', {
        status: response.status,
        statusText: response.statusText
      });
      return NextResponse.json(
        { success: false, error: `Failed to download file: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Create response headers
    const responseHeaders = new Headers();
    const contentType = response.headers.get('content-type');
    console.log('Response headers received:', {
      contentType,
      contentLength: response.headers.get('content-length'),
      status: response.status
    });

    responseHeaders.set('content-type', contentType || 'application/octet-stream');
    
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('content-length', contentLength);
    }
    
    // Properly encode the filename for content-disposition
    const encodedFilename = encodeFilename(fileData.data.itemInfo.name);
    responseHeaders.set('content-disposition', `attachment; filename*=UTF-8''${encodedFilename}`);
    responseHeaders.set('accept-ranges', 'bytes');

    // Handle partial content response
    if (response.status === 206) {
      const contentRange = response.headers.get('content-range');
      if (contentRange) {
        responseHeaders.set('content-range', contentRange);
      }
      console.log('Sending partial content response');
      return new Response(response.body, {
        status: 206,
        headers: responseHeaders,
      });
    }

    // Return streamed response
    console.log('Sending full content response');
    return new Response(response.body, {
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Download error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      cause: error instanceof Error ? error.cause : undefined,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Check for timeout errors
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { success: false, error: 'Download timeout exceeded' },
        { status: 504 }
      );
    }
    
    // Check for aborted/terminated errors
    if (error instanceof Error && (error.name === 'AbortError' || error.message.includes('terminated'))) {
      return NextResponse.json(
        { success: false, error: 'Download was interrupted' },
        { status: 499 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred',
        details: error instanceof Error && error.cause ? String(error.cause) : undefined
      },
      { status: 500 }
    );
  }
}
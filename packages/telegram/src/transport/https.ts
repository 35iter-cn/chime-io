import https from 'node:https';

export interface JsonPostRequest {
  hostname: string;
  path: string;
  body: Record<string, unknown>;
}

export interface JsonPost {
  <TResponse>(request: JsonPostRequest): Promise<TResponse>;
}

export const postJson: JsonPost = async <TResponse>({
  hostname,
  path,
  body,
}: JsonPostRequest): Promise<TResponse> =>
  new Promise<TResponse>((resolve, reject) => {
    const payload = JSON.stringify(body);
    const request = https.request(
      {
        hostname,
        port: 443,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (response) => {
        let data = '';

        response.on('data', (chunk: Buffer | string) => {
          data += chunk.toString();
        });

        response.on('end', () => {
          try {
            resolve(JSON.parse(data) as TResponse);
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            reject(new Error(`Failed to parse response: ${message}`));
          }
        });
      },
    );

    request.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    request.write(payload);
    request.end();
  });

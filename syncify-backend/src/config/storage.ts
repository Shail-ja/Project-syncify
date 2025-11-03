// Placeholder storage config. Replace with your cloud storage SDK as needed.
export interface StorageClient {
  upload: (path: string, data: Buffer) => Promise<string>;
}

export const storage: StorageClient = {
  async upload(path: string, _data: Buffer) {
    // Implement upload logic
    return `mock://storage/${path}`;
  },
};



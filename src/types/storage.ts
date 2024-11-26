export interface StorageAccount {
    email: string;
    password: string;
  }
  
  export interface StorageConfig {
    [key: string]: StorageAccount;
  }
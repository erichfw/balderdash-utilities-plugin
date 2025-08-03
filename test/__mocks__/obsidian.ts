export interface TFile {
  path: string;
  name: string;
  basename: string;
  extension: string;
}

export interface Vault {
  getMarkdownFiles(): TFile[];
}

export interface App {
  vault: Vault;
  metadataCache: {
    getFirstLinkpathDest(linkpath: string, sourcePath: string): TFile | null;
    getFileCache(file: TFile): any;
  };
}
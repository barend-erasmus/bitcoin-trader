export interface ICryptographyAlgorithm {

    decrypt(data: string): string;

    encrypt(data: string): string;

}

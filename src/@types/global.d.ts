declare const BUBISTAT_COMMITHASH: string
declare const BUBISTAT_LASTCOMMITDATETIME: string
declare const BUBISTAT_VERSION: string

declare module '*.png';

declare module "*.svg" {
    const content: any;
    export default content;
}

declare module 'mjml' {
  interface MJMLResult {
    html: string;
    errors: Array<{ message: string }>;
    warnings: Array<{ message: string }>;
  }

  function mjml(mjmlContent: string, options?: {
    minify?: boolean;
    beautify?: boolean;
    keepComments?: boolean;
    validationLevel?: 'strict' | 'soft' | 'skip';
  }): MJMLResult;

  export = mjml;
}







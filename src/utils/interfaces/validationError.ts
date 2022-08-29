export default interface IValidationError extends Error {
  errors: {
    [key: string]: {
      name: string;
      message: string;
      properties: {
        [key: string]: any;
      };
      kind: string;
      path: string;
      value: any;
    };
  };
  _message: string;
  statusCode: number;
  status: string;
  name: string;
  message: string;
}

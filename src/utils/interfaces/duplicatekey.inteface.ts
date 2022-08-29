export default interface IDuplicateKeyError extends Error {
  keyValue: {
    name: string;
  };
}

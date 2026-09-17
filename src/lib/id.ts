/** Id único para linhas de produto/insumo no caderno. */
export function createId(): string {
  return crypto.randomUUID()
}

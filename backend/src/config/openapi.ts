import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'

const filePath = path.join(import.meta.dirname, '../../docs/openapi.yaml')
const fileContent = fs.readFileSync(filePath, 'utf8')

export const openApiDocument = YAML.parse(fileContent)
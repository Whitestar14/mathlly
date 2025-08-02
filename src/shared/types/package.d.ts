declare module '../../package.json' {
  interface PackageJson {
    name: string
    version: string
    private: boolean
    [key: string]: any
  }
  
  const pkg: PackageJson
  export = pkg
}

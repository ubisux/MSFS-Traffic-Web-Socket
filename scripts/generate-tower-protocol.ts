import { pbjs, pbts } from 'protobufjs-cli';
import { mkdir, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dir, '..');
const output = resolve(root, 'src/protocol');
await mkdir(output, { recursive: true });
const generate = (tool: typeof pbjs, args: string[]) => {
 const { promise, resolve, reject } = Promise.withResolvers<string>();
 tool.main(args, (error, result) => error ? reject(error) : result === undefined ? reject(new Error('Generator returned no output')) : resolve(result));
 return promise;
};
const js = await generate(pbjs, ['-t', 'static-module', '-w', 'esm', '--keep-case', '--force-number', '--null-defaults', '--no-service', '--no-delimited', '--no-typeurl', resolve(root, 'protocol/tower.proto')]);
await Bun.write(resolve(output, 'tower.generated.js'), js);
await Bun.write(resolve(output, 'tower.generated.d.ts'), await generate(pbts, [resolve(output, 'tower.generated.js')]));
const flag = process.argv.indexOf('--website');
if (flag !== -1) {
 const target = process.argv[flag + 1];
 if (!target) throw new Error('--website requires a path');
 const destination = resolve(process.cwd(), target, 'src/lib/mtws-protocol');
 await mkdir(destination, { recursive: true });
 for (const name of ['tower.generated.js', 'tower.generated.d.ts']) await copyFile(resolve(output, name), resolve(destination, name));
 await copyFile(resolve(root, 'protocol/tower.proto'), resolve(destination, 'tower.proto'));
}
console.log('Generated tower Protobuf codecs');

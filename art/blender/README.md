# Cena 3D (Blender 5.2)

Scripts que geram e assam a escrivaninha usada em `public/models/desk.glb`.
Os arquivos `.blend` e renders ficam fora do repositório, em
`C:\Users\ONLY\Documents\Craft Claude\Portifolio-3d\` (constante `ROOT` nos scripts).

| Script | O que faz |
|---|---|
| `helpers.py` | Funções comuns (caixas, cilindros, materiais, coleções, cabos). |
| `build_scene.py` | Monta a cena do zero: sala, mesa, computador, luminária, props e câmeras `CamStart`/`CamEnd`. |
| `adjust_v2.py` | Ajustes aprovados: mesa maior, livros reais (atlas de lombadas), caneca café.exe com fumaça, teclado AT de 101 teclas, mouse. |
| `add_props_v3.py` | Calendário de papel (outubro de 1995) na parede, à direita do monitor, e troféu "Projeto do Ano" na mesa, à esquerda. Usa `calendario.png` e `placa_trofeu.png` da pasta `ROOT`. |
| `bake_pipeline.py` | Une os objetos estáticos em 3 grupos, assa a luz (Cycles), remove ruído (OIDN) e exporta o `.glb`. |
| `bake_run.py` | Executa uma etapa do bake em segundo plano. |
| `start_mcp.py` | Abre o Blender com o servidor MCP ligado (para editar com o Claude acompanhando). |

## Refazer o modelo

```bash
B="C:/Program Files/Blender Foundation/Blender 5.2/blender.exe"
# 1. cena editável (desk.blend) — rode build_scene.py, adjust_v2.py e add_props_v3.py dentro do Blender
# 2. cópia para o bake
"$B" -b desk.blend --python-expr "import bpy; bpy.ops.wm.save_as_mainfile(filepath='desk_bake.blend'); exec(open('bake_pipeline.py').read()); prepare(); bpy.ops.wm.save_mainfile()"
# 3. bake + denoise de cada grupo e export
for g in Fundo Computador Objetos export; do "$B" -b desk_bake.blend --python bake_run.py -- $g; done
# 4. otimizar e validar
npx gltf-transform optimize desk-raw.glb public/models/desk.glb --compress draco --texture-compress webp --texture-size 2048 --simplify false --join false --instance false --flatten false
npm run check:model
```

Os lightmaps já saem com a curva AgX aplicada; o site os mostra com `MeshBasicMaterial`, sem tone mapping.

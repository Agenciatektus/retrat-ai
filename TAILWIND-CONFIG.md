# Configuração do Tailwind CSS v4

Este projeto usa **Tailwind CSS v4** com as seguintes configurações para resolver warnings de linting:

## Arquivos de Configuração

### 1. PostCSS (`postcss.config.mjs`)
```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  },
};
```

### 2. VS Code Settings (`.vscode/settings.json`)
- Desabilita validação CSS nativa: `"css.validate": false`
- Ignora regras desconhecidas: `"css.lint.unknownAtRules": "ignore"`
- Configura associação de arquivos para Tailwind: `"*.css": "tailwindcss"`

### 3. CSS Custom Data (`.vscode/css_custom_data.json`)
Define as diretivas do Tailwind como válidas:
- `@tailwind`
- `@apply`
- `@layer`
- `@config`
- `@theme`

## Warnings Conhecidos

Os warnings `Unknown at rule @tailwind` são normais em projetos Tailwind e foram suprimidos através de:

1. **Comentários específicos no CSS**: `/* stylelint-disable at-rule-no-unknown */`
2. **Configuração do VS Code**: Desabilita validação CSS nativa
3. **Arquivo de dados customizados**: Define as diretivas como válidas

## Extensões Recomendadas

- `bradlc.vscode-tailwindcss` - Suporte oficial do Tailwind CSS
- `esbenp.prettier-vscode` - Formatação automática
- `ms-vscode.vscode-typescript-next` - Suporte TypeScript

## Troubleshooting

Se ainda aparecerem warnings:
1. Reinicie o VS Code
2. Execute `Ctrl+Shift+P` → "Developer: Reload Window"
3. Verifique se as extensões recomendadas estão instaladas

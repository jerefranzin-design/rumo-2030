# Rumo 2030

App pessoal de finanças (PWA, mobile-first) com foco na meta: **M3 Competition em 2030**.

## Rodar
```bash
npm install
npm run dev        # abre em http://localhost:5173/rumo-2030/
npm run build      # gera a versão final em dist/
```

## O que tem
- **Início**: sobra do mês, receitas, despesas, quanto foi guardado, gastos por categoria.
- **Lançamentos**: lista por dia, filtros e busca. Toque para editar/excluir.
- **Meta**: progresso, quanto guardar por mês, previsão de chegada no ritmo atual, projeção.
  - O preço do carro é corrigido pela "alta do preço % a.a." até o prazo.
  - O dinheiro guardado rende pelo "rendimento % a.a.".
  - Lançamentos da meta: *Aporte* (sai do seu bolso), *Rendimento* (juros), *Retirada*.
- **Ajustes**: editar meta, exportar/importar backup JSON, apagar tudo.

Os dados ficam só no aparelho (IndexedDB). Faça backup.

## Instalar no celular
Publicado em https://jerefranzin-design.github.io/rumo-2030/ (cada push na main atualiza).
No celular, abrir o link → menu do navegador → "Adicionar à tela inicial".

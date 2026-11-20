export function Logo() {
  return <span className="logo"><em>Studio</em> Jeremias</span>;
}

/** Primeira palavra pesada e itálica, o resto leve (contraste do logotipo Studio Jeremias). */
export function Contraste({ text }: { text: string }) {
  const [first, ...rest] = text.trim().split(/\s+/);
  return <><em>{first}</em>{rest.length ? ' ' + rest.join(' ') : ''}</>;
}

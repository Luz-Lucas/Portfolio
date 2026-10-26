const ITEMS = [
  { name: 'todo-app-v7-final-AGORA-VAI.zip', note: 'Sétima tentativa do mesmo app de tarefas.' },
  { name: 'meu-framework-js.tar', note: 'O mundo não precisava de mais um. Descobri isso a tempo.' },
  { name: 'node_modules/', note: 'Pesava mais que o resto do computador.' },
];

export function Trash() {
  return (
    <div className="p3d-trash">
      <p>Projetos abandonados ({ITEMS.length} itens)</p>
      <ul>
        {ITEMS.map((i) => (
          <li key={i.name}>
            <b>{i.name}</b>
            <span>{i.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

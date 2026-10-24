export default function LazyPanel(props: { title: string }) {
  return <p data-testid="lazy-panel">panel: {props.title}</p>;
}

import styles from "./chip.module.css";

export function ChipList({ children }: { children: React.ReactNode }) {
  return <ul className={styles.chipList}>{children}</ul>;
}

interface ChipPops {
  children: React.ReactNode;
  as?: "li";
}

export function Chip({ children, as: asElement }: ChipPops) {
  const Wrapper = asElement ?? "div";
  return (
    <Wrapper className={styles.chip}>
      <small>{children}</small>
    </Wrapper>
  );
}

import { tv } from "tailwind-variants";

type LoadingPageProps = {
  className?: string;
};

const loadingPageStyles = tv({
  base: "grid place-items-center bg-canvas px-5 py-8",
});

function LoadingPage({ className = "min-h-svh" }: LoadingPageProps) {
  return (
    <div className={loadingPageStyles({ className })}>
      <output className="m-0 text-body-small text-muted" aria-live="polite">
        Carregando...
      </output>
    </div>
  );
}

export default LoadingPage;

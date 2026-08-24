type LoadingPageProps = {
  className?: string;
};

function LoadingPage({ className = "min-h-svh" }: LoadingPageProps) {
  return (
    <div className={`grid place-items-center bg-canvas px-5 py-8 ${className}`}>
      <output className="m-0 text-body-small text-muted" aria-live="polite">
        Carregando...
      </output>
    </div>
  );
}

export default LoadingPage;

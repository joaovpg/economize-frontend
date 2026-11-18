import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";

import { Link } from "../Link";

type ComingSoonPageProps = {
  description: string;
  title: string;
};

export function ComingSoonPage({ description, title }: ComingSoonPageProps) {
  return (
    <section className="grid max-w-xl gap-3 px-6 py-16" aria-labelledby="placeholder-title">
      <h1 className="m-0 text-title-page" id="placeholder-title">
        {title}
      </h1>
      <p className="m-0 text-body text-muted">{description}</p>
      <p className="m-0 text-body text-muted">Esta área está sendo preparada.</p>
      <Link to="/summary" variant="secondary" leadingIcon={<ArrowLeftIcon aria-hidden="true" />}>
        Voltar ao resumo
      </Link>
    </section>
  );
}

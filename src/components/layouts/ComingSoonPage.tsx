import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";

import { Link } from "../Link";

type ComingSoonPageProps = {
  description: string;
  title: string;
};

export function ComingSoonPage({ description, title }: ComingSoonPageProps) {
  return (
    <section className="grid max-w-152 gap-3.5 px-7 py-16" aria-labelledby="placeholder-title">
      <h1 className="m-0 text-page-title" id="placeholder-title">
        {title}
      </h1>
      <p className="m-0 text-body text-muted">{description}</p>
      <p className="m-0 text-body-small text-subtle">Esta área está sendo preparada.</p>
      <Link to="/summary" variant="secondary" leadingIcon={<ArrowLeftIcon aria-hidden="true" />}>
        Voltar ao resumo
      </Link>
    </section>
  );
}

import { useController, useFormState, type Control } from "react-hook-form";

import { today } from "@internationalized/date";

import { DatePicker } from "../../../../components/fields/DatePicker";
import { RadioGroup, RadioItem } from "../../../../components/fields/RadioGroup";
import { Select, SelectItem } from "../../../../components/fields/Select";
import { Switch } from "../../../../components/fields/Switch";
import { TextField } from "../../../../components/fields/TextField";
import { parseFormDate, transactionTimeZone } from "../../../../lib/date";
import { type FormularioOperacaoFinanceira } from "./transaction-form";
import {
  createRepeticaoFormValues,
  frequenciaRepeticaoOptions,
  getAncoragemRepeticaoOptions,
  terminoRepeticaoOptions,
  type RepeticaoFormulario,
} from "./transaction-repetition-form";

type TerminoFormulario = RepeticaoFormulario["termino"];

export type TransactionRepetitionFieldsProps = {
  /** Control do formulário que contém o campo `repeticao`. */
  control: Control<FormularioOperacaoFinanceira>;
  /** Data financeira da transação; é o início da regra e a base das validações de data. */
  dataFinanceira: string;
  isDisabled?: boolean;
  /**
   * Valores aplicados ao ligar Repetir. Padrão: valores de criação. A edição passa a regra lida,
   * para que desligar e religar não perca a parcela inicial nem a quantidade da ocorrência.
   */
  valoresAoAtivar?: RepeticaoFormulario;
};

/**
 * Seção Repetir: switch, frequência com intervalo, ancoragem mensal e término. Não envia nada por
 * conta própria; os valores ficam no campo `repeticao` do formulário e são convertidos por
 * `toRepeticaoRequestFromForm`.
 */
export function TransactionRepetitionFields({
  control,
  dataFinanceira,
  isDisabled = false,
  valoresAoAtivar = createRepeticaoFormValues(true),
}: TransactionRepetitionFieldsProps) {
  const { field } = useController({ control, name: "repeticao" });
  const { errors } = useFormState({ control });
  const repeticao = field.value;
  const repeticaoErrors = errors.repeticao;
  const ancoragemOptions = getAncoragemRepeticaoOptions(dataFinanceira);

  const update = (patch: Partial<RepeticaoFormulario>) => {
    field.onChange({ ...repeticao, ...patch });
  };

  const updateTermino = (patch: Partial<TerminoFormulario>) => {
    update({ termino: { ...repeticao.termino, ...patch } });
  };

  return (
    <section className="grid min-w-0 gap-3 rounded-control border border-border bg-surface-muted px-3 py-3">
      <div className="flex min-h-8 items-center justify-between gap-3">
        <span className="text-body-strong text-foreground">Repetir</span>
        <Switch
          aria-label="Repetir"
          isDisabled={isDisabled}
          isSelected={repeticao.ativa}
          onChange={(ativa) => {
            field.onChange(
              ativa ? { ...valoresAoAtivar, ativa } : createRepeticaoFormValues(false),
            );
          }}
        />
      </div>

      {repeticao.ativa && (
        <>
          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <TextField
              errorMessage={repeticaoErrors?.intervalo?.message}
              inputMode="numeric"
              isDisabled={isDisabled}
              label="A cada"
              maxLength={10}
              onChange={(intervalo) => {
                update({ intervalo });
              }}
              placeholder="1"
              value={repeticao.intervalo}
            />
            <Select
              errorMessage={repeticaoErrors?.frequencia?.message}
              isDisabled={isDisabled}
              label="Frequência"
              onChange={(nextValue) => {
                const nextFrequencia = frequenciaRepeticaoOptions.find(
                  (option) => option.value === String(nextValue),
                )?.value;

                if (nextFrequencia) {
                  update({ frequencia: nextFrequencia });
                }
              }}
              value={repeticao.frequencia}
            >
              {frequenciaRepeticaoOptions.map((option) => (
                <SelectItem id={option.value} key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>

          {repeticao.frequencia === "MENSAL" && (
            <RadioGroup
              orientation="horizontal"
              errorMessage={repeticaoErrors?.ancoragem?.message}
              isDisabled={isDisabled}
              label="Ancoragem"
              onChange={(nextValue) => {
                const nextAncoragem = ancoragemOptions.find(
                  (option) => option.value === nextValue,
                )?.value;

                if (nextAncoragem) {
                  update({ ancoragem: nextAncoragem });
                }
              }}
              value={repeticao.ancoragem}
            >
              {ancoragemOptions.map((option) => (
                <RadioItem key={option.value} value={option.value}>
                  {option.label}
                </RadioItem>
              ))}
            </RadioGroup>
          )}

          <div className="grid min-w-0 gap-4 sm:grid-cols-2">
            <Select
              errorMessage={repeticaoErrors?.termino?.tipo?.message}
              isDisabled={isDisabled}
              label="Termina"
              onChange={(nextValue) => {
                const nextTipo = terminoRepeticaoOptions.find(
                  (option) => option.value === String(nextValue),
                )?.value;

                if (nextTipo) {
                  updateTermino({ tipo: nextTipo });
                }
              }}
              value={repeticao.termino.tipo}
            >
              {terminoRepeticaoOptions.map((option) => (
                <SelectItem id={option.value} key={option.value} textValue={option.label}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <TerminoDetalhe
              dataFinanceira={dataFinanceira}
              errors={repeticaoErrors?.termino}
              isDisabled={isDisabled}
              onChange={updateTermino}
              termino={repeticao.termino}
            />
          </div>

          {repeticao.termino.tipo === "PARCELAS" && (
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <TextField
                errorMessage={repeticaoErrors?.termino?.numeroPrimeiraParcela?.message}
                inputMode="numeric"
                isDisabled={isDisabled}
                label="Parcela inicial"
                maxLength={10}
                onChange={(numeroPrimeiraParcela) => {
                  updateTermino({ numeroPrimeiraParcela });
                }}
                placeholder="1"
                value={repeticao.termino.numeroPrimeiraParcela}
              />
              <TextField
                errorMessage={repeticaoErrors?.termino?.totalParcelas?.message}
                inputMode="numeric"
                isDisabled={isDisabled}
                label="Total de parcelas"
                maxLength={10}
                onChange={(totalParcelas) => {
                  updateTermino({ totalParcelas });
                }}
                placeholder="Ex.: 10"
                value={repeticao.termino.totalParcelas}
              />
            </div>
          )}
        </>
      )}
    </section>
  );
}

type TerminoDetalheProps = {
  dataFinanceira: string;
  errors: { data?: { message?: string }; quantidade?: { message?: string } } | undefined;
  isDisabled: boolean;
  onChange: (patch: Partial<TerminoFormulario>) => void;
  termino: TerminoFormulario;
};

/** Campo complementar ao tipo de término: data final ou quantidade de ocorrências. */
function TerminoDetalhe({
  dataFinanceira,
  errors,
  isDisabled,
  onChange,
  termino,
}: TerminoDetalheProps) {
  switch (termino.tipo) {
    case "EM_DATA":
      return (
        <DatePicker
          errorMessage={errors?.data?.message}
          isDisabled={isDisabled}
          label="Data final"
          minValue={parseFormDate(dataFinanceira)}
          onChange={(date) => {
            onChange({ data: date?.toString() ?? "" });
          }}
          todayValue={today(transactionTimeZone)}
          value={parseFormDate(termino.data)}
        />
      );
    case "APOS_OCORRENCIAS":
      return (
        <TextField
          errorMessage={errors?.quantidade?.message}
          inputMode="numeric"
          isDisabled={isDisabled}
          label="Quantidade de ocorrências"
          maxLength={10}
          onChange={(quantidade) => {
            onChange({ quantidade });
          }}
          placeholder="Ex.: 12"
          value={termino.quantidade}
        />
      );
    case "INDEFINIDO":
      return (
        <p className="m-0 self-end pb-4 text-caption text-muted">
          A repetição continua até ser encerrada.
        </p>
      );
    case "PARCELAS":
      return null;
    default: {
      const exhaustive: never = termino.tipo;
      return exhaustive;
    }
  }
}

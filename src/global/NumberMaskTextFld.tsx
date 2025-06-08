import { useIMask, ReactMaskOpts } from 'react-imask';
import { TextField, TextFieldPropOnChange } from '@consta/uikit/TextFieldCanary';
import { useEffect, useState } from 'react';

interface NumberMaskTextFldProps {
  value?: string | null;
  onChange: TextFieldPropOnChange<string | null>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const NumberMaskTextFld: React.FC<NumberMaskTextFldProps> = (props) => {
  const { value: propValue, ...others } = props;

  // Локальный стейт для value, чтобы синхронизировать с маской
  const [val, setVal] = useState<string | null | undefined>(propValue || null);


  // useIMask с параметром ref, чтобы получить доступ к maskInstance
  const { ref } = useIMask<HTMLInputElement, ReactMaskOpts>({
    mask: Number,
    min: 0,
    scale: 2,
    radix: '.',
    padFractionalZeros: true,
    autofix: true,
    lazy: true,
    normalizeZeros: true,
    mapToRadix: ['.', ','],
  });

  useEffect(() => {
    if (val !== props.value) {
        setVal(props.value);
    }
     
  }, [props.value, val]);


  return (
    <TextField
      placeholder="0"
      inputRef={ref}
    //   value={val}
      {...others}
    />
  );
};
import { ReactMaskOpts, useIMask } from 'react-imask';
import { TextField } from '@consta/uikit/TextFieldCanary';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
export const NumberMaskTextField = (props) => {

    // eslint-disable-next-line prefer-const
    let { ref, value} = useIMask<
    HTMLInputElement,
    ReactMaskOpts
  >(
    {
    mask: Number,
    min: -Infinity,
    scale: props.scale ?? 2,
    thousandsSeparator: '',
    radix: '.',
    padFractionalZeros: true,
    autofix: true,
    lazy: true,
    normalizeZeros: true,
    mapToRadix: ['.'],
  });
  if (!value) {
    value=props.value
  }
  

  return (
      <TextField 
        {...props}
        onChange={props.onChange}
        value={value}
        placeholder="0" 
        inputRef={ref} 
        />
  );
};

export default NumberMaskTextField;
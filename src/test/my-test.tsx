import React from 'react';
import SamuiSlideProvider, { SamuiSlideComponentProps } from 'shared/components/SamuiSlideProvider';

/*
eval("alert('asd');");
const func = new Function("a", "b", "c", "alert(a + c)");
func(1, 2, 3);
*/

function A(props: SamuiSlideComponentProps) {
  console.log(props);
  return (
    <div>a<button onClick={props.slideNext}>next</button></div>
  );
}

export default function App() {
  return (
    <SamuiSlideProvider
      contents={[
        {
          key: 'a',
          component: A,
        },
        {
          key: 'b',
          component: A,
        }
      ]} />
  );
}
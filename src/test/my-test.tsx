import { stringify } from 'qs';
import { useEffect, useState } from 'react';
import { Transition } from 'react-transition-group';
import qs from 'qs';

/*
eval("alert('asd');");
const func = new Function("a", "b", "c", "alert(a + c)");
func(1, 2, 3);
*/

export default function App() {
  const aa = stringify({
    populate: [
      'questions',
      'questions.correct_answer',
      'questions.correct_answer.img_url',
    ]
  });
  const bb = qs.stringify({
    fields: ['name', 'slug'],
    filters: {
      slug: 'basic-graphic-design-principles',
    },
    populate: {
      contents: {
        fields: ['name', 'slug'],
        populate: {
          theories: {
            populate: '*',
          },
          questions: {
            populate: {
              correct_answer: {
                populate: {
                  img: {
                    fields: ['name', 'url'],
                  }
                }
              },
              incorrect_answer: {
                populate: {
                  img: {
                    fields: ['name', 'url'],
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  useEffect(() => {
    fetch(`https://webproject2022-admin.herokuapp.com/api/contents/2?${bb}`)
      .then(response => response.json())
      .then(json => console.log(json))
      .catch(err => console.error(err));
  }, []);
  return (
    <div>
      <a href={`https://webproject2022-admin.herokuapp.com/api/courses?${bb}`} >open</a>
    </div>
  );
}
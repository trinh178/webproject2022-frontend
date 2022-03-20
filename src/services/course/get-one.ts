import qs from "qs";
import {
  EduContentQuestionProps,
  EduContentTheoryProps,
  EduCourseProps,
} from "./types";
import ImagePreloader from "image-preloader";

interface CourseGetOneResponseProps {
  id: number;
  attributes: {
    name: string;
    slug: string;
    contents: {
      data: {
        id: number;
        attributes: {
          name: string;
          slug: string;
          theories: {
            id: number;
            text: string;
            canvas_script: string;
          }[];
          questions: {
            id: number;
            correct_answer: {
              id: number;
              img: {
                data: {
                  id: number;
                  attributes: {
                    url: string;
                  };
                };
              };
            };
            incorrect_answer: {
              id: number;
              img: {
                data: {
                  id: number;
                  attributes: {
                    url: string;
                  };
                };
              };
            };
          }[];
        };
      }[];
    };
  };
}

export default async function api(slug: string): Promise<EduCourseProps> {
  const query: string = qs.stringify({
    fields: ["name", "slug"],
    filters: {
      slug: slug,
    },
    populate: {
      contents: {
        fields: ["name", "slug"],
        populate: {
          theories: {
            populate: "*",
          },
          questions: {
            populate: {
              correct_answer: {
                populate: {
                  img: {
                    fields: ["url"],
                  },
                },
              },
              incorrect_answer: {
                populate: {
                  img: {
                    fields: ["url"],
                  },
                },
              },
            },
          },
        },
      },
    },
  });
  const res = await fetch(
    `${process.env.REACT_APP_END_POINT}/api/courses?${query}`
  );
  const data = await res.json();
  const mappedData = mapping(data);
  await preload(mappedData);
  return mappedData;
}

async function preload(data: EduCourseProps) {
  for (const content of data.contents) {
    for (const question of content.questions) {
      await ImagePreloader.simplePreload(question.correctAnswer.imgUrl);
      await ImagePreloader.simplePreload(question.incorrectAnswer.imgUrl);
    }
  }
}

function mapping(
  res: ResponseWrapperProps<CourseGetOneResponseProps>
): EduCourseProps {
  const courseResponse = res.data[0];
  const course: EduCourseProps = {
    name: courseResponse.attributes.name,
    slug: courseResponse.attributes.slug,
    contents: courseResponse.attributes.contents.data.map((c) => ({
      name: c.attributes.name,
      slug: c.attributes.slug,
      theories: c.attributes.theories.map<EduContentTheoryProps>((t) => ({
        text: t.text,
        canvasScript: t.canvas_script,
      })),
      questions: c.attributes.questions.map<EduContentQuestionProps>((q) => ({
        correctAnswer: {
          imgUrl: q.correct_answer.img.data.attributes.url,
        },
        incorrectAnswer: {
          imgUrl: q.incorrect_answer.img.data.attributes.url,
        },
      })),
    })),
  };
  return course;
}

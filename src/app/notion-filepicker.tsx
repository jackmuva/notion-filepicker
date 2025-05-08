import { useState, useEffect } from "react";
import Image from "next/image";
import { paragon } from "@useparagon/connect";

export const NotionFilepicker = (props: { toggle: () => void }) => {
  const [pickerState, setPickerState] = useState<{ pages: any, pickedPage: any }>({ pages: [], pickedPage: {} });

  useEffect(() => {
    getNotionPages().then((allPages) => {
      setPickerState((prev) => ({ ...prev, pages: allPages }));
    })
  }, []);

  const getNotionPages = async () => {
    const response = await fetch("https://actionkit.useparagon.com/projects/" + process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID + "/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sessionStorage.getItem("jwt") },
      body: JSON.stringify({ action: 'NOTION_SEARCH_PAGES', parameters: {} })
    });
    const body = await response.json();
    console.log(body);
    return body;
  }

  const selectPage = (page: any) => {
    setPickerState((prev) => ({
      ...prev, pickedPage: page
    }));
  }

  const sendSummary = async (id: string) => {
    const response = await fetch("https://actionkit.useparagon.com/projects/" + process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID + "/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": "Bearer " + sessionStorage.getItem("jwt") },
      body: JSON.stringify({
        action: 'NOTION_CREATE_PAGE', parameters: {
          parent: { page_id: id },
          properties: { title: [{ text: { content: "SUMMARY DEMO" } }] },
          children: [
            {
              object: "block",
              type: "paragraph",
              paragraph: {
                rich_text: [
                  {
                    type: "text",
                    text: {
                      content: "The fish is my friend too... I have never seen or heard of such a fish. But I must kill him. I am glad we do not have to try to kill the stars. Imagine if each day a man must try to kill the moon, he thought. The moon runs away. But imagine if a man each day should have to try to kill the sun? We were born lucky; he thought"
                    }
                  }
                ]
              }
            }
          ]
        }
      })
    });
    const body = await response.json();
    console.log(body);
    return body;

  }

  return (
    <div className="h-96 w-96 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    flex flex-col space-y-3 items-center z-20 bg-stone-200 rounded-md text-black p-2">
      <button className={"absolute top-1 right-2 font-bold"} onClick={() => props.toggle()}>X</button>
      <div className="font-bold font-['Helvetica'] w-full pl-4"> Notion Pages: </div>
      <div className="p-2 w-11/12 flex flex-col space-y-0 h-64 rounded-md bg-stone-50 border-stone-500 overflow-y-scroll overflow-x-scroll">
        {pickerState.pages.map((page: any) => {
          return (
            <button className={pickerState.pickedPage.id === page.id ? "flex font-bold p-1 overflow-x-scroll w-full rounded-md bg-blue-400" :
              "flex p-1 overflow-x-scroll w-full hover:bg-blue-200 rounded-md"}
              onClick={() => selectPage(page)}>
              <Image
                className=""
                src="/notion-logo.png"
                alt="Page Icon"
                width={25}
                height={25}
                priority
              />
              <div className="truncate ">{page.properties.title.title[0].text.content}</div>
            </button>
          )
        })
        }
      </div>
      <div className="flex space-x-2">
        <button className="rounded-md text-stone-50 bg-stone-700 p-2 font-semibold hover:bg-stone-800"
          onClick={() => sendSummary(pickerState.pickedPage.id)}
          disabled={Object.keys(pickerState.pickedPage).length === 0 ? true : false}>
          Send Demo Summary
        </button>
        <button className="rounded-md text-stone-50 bg-red-700 p-2 font-semibold hover:bg-red-800"
          onClick={() => {
            paragon.uninstallIntegration("notion", {}).then(() => {
              props.toggle();
            });
          }}>
          Disconnect
        </button>
      </div>
    </div>)
}

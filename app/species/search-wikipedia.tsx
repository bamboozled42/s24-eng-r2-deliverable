// @ts-nocheck
"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, type BaseSyntheticEvent } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const searchParameters = z.object({
  search_parameter: z
    .string()
    .nullable()
    // Transform empty string or only whitespace input to null before form submission, and trim whitespace otherwise
    .transform((val) => (!val || val.trim() === "" ? null : val.trim())),
});

type FormData = z.infer<typeof searchParameters>;

interface WikipediaSearchFunctionProps {
  setUrl: (url: string) => void;
  setDescription: (description: string) => void;
}


//pass in props from add-specoes dialogue
export default function WikipediaSearchFunction({ setUrl, setDescription }: WikipediaSearchFunctionProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(searchParameters),
    mode: "onChange",
  });
  //create functions in order to implement async functions and useeffect
  const [results, setResults] = useState([]);
  const [searchInfo, setSearchInfo] = useState<{ totalhits?: number }>({});
  const [resultsText, setResultsText] = useState({});
  const handleSearch = async (formData: FormData) => {
    console.log("Enter works");

    // recieve 'search_parameter' from the submitted form data
    const searchParam = formData.search_parameter;

    // Check if 'search_parameter' is empty or null and return early if it is, since it will save a lot of error checking later
    if (!searchParam) return;

    const endpoint1 = `https://en.wikipedia.org/w/api.php?action=query&list=search&prop=info&inprop=url&utf8=&format=json&origin=*&srlimit=20&srsearch=${searchParam}`;
    const endpoint2 = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchParam}&prop=pageimages&piprop=thumbnail&pithumbsize=100&format=json&origin=*`;
    const endpoint3 = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchParam}&prop=extracts&exintro&explaintext&format=json&origin=*`;
    //recieve data from API
    const response1 = await fetch(endpoint1);
    const response2 = await fetch(endpoint2);
    const response3 = await fetch(endpoint3);

    if (!response1.ok) {
      throw Error(response1.statusText);
    }
    if (!response2.ok) {
      throw Error(response2.statusText);
    }
    if (!response3.ok) {
      throw Error(response3.statusText);
    }

    const json1 = await response1.json();
    console.log(json1);
    const json2 = await response2.json();
    console.log(json2);
    const json3 = await response3.json();
    console.log(json3);
    
    setSearchInfo(json1.query.searchinfo);
    console.log(searchInfo);
    setResults(json2.query.pages);
    setResultsText(json3.query.pages);
  };
  useEffect(() => {
    // using UseEffect so this effect only runs when `searchInfo` changes
    if (searchInfo && searchInfo.totalhits === 0) {
      console.log("toast activated");
      console.log(searchInfo.totalhits);
      toast({
        title: "Search Result Does Not Exist",
        variant: "destructive",
      });
    }
  }, [searchInfo]);

  useEffect(() => {
    // change the `results` object into an array of its values
    const resultsArray = Object.values(results);
    if (resultsArray.length !== 0) {
      // Find the result with index 1 since it is the most relevant search
      const resultWithIndexOne = resultsArray.find((result) => result.index === 1);

      // Check if the result with index 1 exists and has a thumbnail
      if (resultWithIndexOne?.thumbnail) {
        const url = resultWithIndexOne.thumbnail.source;
        console.log("Thumbnail URL of the result with index 1:", url);
        //employ the prop passed on earlier on
        setUrl(url);
        console.log("after setting url", setUrl);
      }
    }
  }, [results]);

  useEffect(() => {
    // convert the result text object into an array of its values
    const resultsTextArray = Object.values(resultsText);
    if (resultsTextArray.length !== 0) {
      // Find the result with index 1 since it is the most relevant
      const resultTextWithIndexOne = resultsTextArray.find((resultText) => resultText.index === 1);

      // Check if the result with index 1 exists and extract it's preview
      if (resultTextWithIndexOne?.extract) {
        const extract = resultTextWithIndexOne.extract;
        //split to find the first paragraph
        const paragraphs = extract.split("\n");
        const description = paragraphs[0];
        console.log("Description of the result with index 1:", description);
        //use prop to change the parameter
        setDescription(description);
        form.setValue("search_parameter", "");
      }
    }
  }, [resultsText]);

  return (
    <div>
      <Form {...form}>
        <form onSubmit={(e: BaseSyntheticEvent) => void form.handleSubmit(handleSearch)(e)}>
          <div className="grid w-full items-center gap-4">
            <FormField
              control={form.control}
              name="search_parameter"
              render={({ field }) => {
                // We must extract value from field and convert a potential defaultValue of `null` to "" because inputs can't handle null values: https://github.com/orgs/react-hook-form/discussions/4091
                const { value, ...rest } = field;
                return (
                  <FormItem>
                    <FormLabel>Search Wikipedia</FormLabel>
                    <FormControl>
                      <Input
                        value={value ?? ""}
                        placeholder="Please type in a scientific or a common name to search."
                        {...rest}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
            <div className="flex">
              <Button type="submit" className="ml-1 mr-1 flex-auto">
                Search
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

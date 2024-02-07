//change inline to function css
"use client";
/*
Note: "use client" is a Next.js App Router directive that tells React to render the component as
a client component rather than a server component. This establishes the server-client boundary,
providing access to client-side functionality such as hooks and event handlers to this component and
any of its imported children. Although the SpeciesCard component itself does not use any client-side
functionality, it is beneficial to move it to the client because it is rendered in a list with a unique
key prop in species/page.tsx. When multiple component instances are rendered from a list, React uses the unique key prop
on the client-side to correctly match component state and props should the order of the list ever change.
React server components don't track state between rerenders, so leaving the uniquely identified components (e.g. SpeciesCard)
can cause errors with matching props and state in child components if the list order changes.
*/
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { createBrowserSupabaseClient } from "@/lib/client-utils";
import type { Database } from "@/lib/schema";
import Image from "next/image";
import { useRouter } from "next/navigation";
import EditSpeciesDialog from "./edit-species-dialog";
type Species = Database["public"]["Tables"]["species"]["Row"];

export default function SpeciesCard({ species, userId }: { species: Species; userId: string }) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const handleDelete = async () => {
    const deleteConfirmed = window.confirm("Are you sure you want to delete this species?");
    if (deleteConfirmed) {
      const { error } = await supabase.from("species").delete().eq("id", species.id);

      // Catch and report errors from Supabase and exit the onSubmit function with an early 'return' if an error occurred.
      if (error) {
        return toast({
          title: "Something went wrong.",
          description: error.message,
          variant: "destructive",
        });
      }

      router.refresh();

      return toast({
        title: "Species Deleted Sucessfully!",
        description: "Successfully Deleted " + species.scientific_name + ".",
      });
    }
  };
  return (
    <div className="m-4 w-72 min-w-72 flex-none rounded border-2 p-3 shadow">
      {species.image && (
        <div className="relative h-40 w-full">
          <Image src={species.image} alt={species.scientific_name} fill style={{ objectFit: "cover" }} />
        </div>
      )}
      <h3 className="mt-3 text-2xl font-semibold">{species.scientific_name}</h3>
      <h4 className="text-lg font-light italic">{species.common_name}</h4>
      <p>{species.description ? species.description.slice(0, 150).trim() + "..." : ""}</p>
      {/* Replace the button with the detailed view dialog. */}
      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-3 w-full">Learn More</Button>
        </DialogTrigger>
        <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{species.common_name}</DialogTitle>
          </DialogHeader>
          {/* Create a table to neatly organize data */}
          <table style={{ width: "80%", borderCollapse: "collapse", margin: "20px auto" }}>
            <tr>
              <th style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px", textAlign: "left" }}>
                Scientific Name
              </th>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>{species.scientific_name}</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px", textAlign: "left" }}>
                Total Population
              </th>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>{species.total_population}</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px", textAlign: "left" }}>
                Kingdom
              </th>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>{species.kingdom}</td>
            </tr>
            <tr>
              <th style={{ backgroundColor: "#4CAF50", color: "white", padding: "10px", textAlign: "left" }}>
                Description
              </th>
              <td style={{ border: "1px solid #ddd", padding: "10px" }}>{species.description}</td>
            </tr>
          </table>

          <DialogClose asChild>
            <Button type="button" className="ml-1 mr-1 flex-auto" variant="secondary">
              Return
            </Button>
          </DialogClose>
          {/* check conditional, these options should only exist if user owns the file */}
          {/* use flexbox */}
          {species.author === userId && (
            <div style={{ display: "flex", alignItems: "stretch" }}>
              <EditSpeciesDialog species={species} />
              <Button type="button" variant="destructive" onClick={() => void handleDelete()} style={{ flex: 1 }}>
                Delete
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

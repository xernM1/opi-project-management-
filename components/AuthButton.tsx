import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AuthButton() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <form action={signOut}>
        <button className="py-2 px-4 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover">
          Logout
        </button>
      </form>
    </div>
  ) : (
    <>
      <div className="button-container flex justify-end gap-2"> {/* Adjust the gap as needed */}
  <Link
    href="/login"
    className="py-2 px-3 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
  >
    Login
  </Link>
  <Link
    href="/signup"
    className="py-2 px-3 rounded-md no-underline bg-btn-background hover:bg-btn-background-hover"
  >
    Signup
  </Link>
</div>

    </>
  );
}

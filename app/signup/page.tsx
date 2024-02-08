import Link from "next/link";
import { headers, cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";


export default function SignUp({
    searchParams,
  }: {
    searchParams: { message: string };
  }) {


const signUp = async (formData: FormData) => {
    "use server";

    const origin = headers().get("origin");
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    //User profile data
    const firstName = formData.get("firstName");
    const lastName = formData.get("lastName");
    
    const jobTitle = formData.get("jobTitle");
    const phone = formData.get("phone");

    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (response.error) {
      return redirect("/login?message=Could not authenticate user");
    }
    const user = response.data.user
    if(user){
         await supabase.from('profile').insert([{
          id: user.id,
          first_name: firstName,
          last_name: lastName,
          job_title: jobTitle,
          phone: phone,
        }]);
    }
    return redirect("/login?message=Check email to continue sign up process");
   
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
    <div className="flex flex-col w-full px-8 sm:max-w-md justify-center gap-2">  
      <Link
        href="/"
        className="absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm"
      >
        {/* SVG and 'Back' text */}
      </Link>

      <form action={signUp} className="animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
        {/* Email Field */}
        <label className="text-md" htmlFor="email">Email</label>
        <input className="rounded-md px-4 py-2 bg-inherit border mb-6" name="email" placeholder="you@example.com" required />

        {/* Password Field */}
        <label className="text-md" htmlFor="password">Password</label>
        <input className="rounded-md px-4 py-2 bg-inherit border mb-6" type="password" name="password" placeholder="••••••••" required />

        {/* First Name Field */}
        <label className="text-md" htmlFor="firstName">First Name</label>
        <input className="rounded-md px-4 py-2 bg-inherit border mb-6" name="firstName" required />

        {/* Last Name Field */}
        <label className="text-md" htmlFor="lastName">Last Name</label>
        <input className="rounded-md px-4 py-2 bg-inherit border mb-6" name="lastName" required />


        {/* Job Title Field */}
        <label className="text-md" htmlFor="jobTitle">Job Title</label>
        <input className="rounded-md px-4 py-2 bg-inherit border mb-6" name="jobTitle" required />

        {/* Phone Field */}
        <label className="text-md" htmlFor="phone">Phone</label>
        <input className="rounded-md px-4 py-2 bg-inherit border mb-6" name="phone" required />

        {/* Submit Button */}
        <button type="submit" className="border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2">
          Sign Up
        </button>

        {/* Display Error or Success Message */}
        {searchParams?.message && (
          <p className="mt-4 p-4 bg-foreground/10 text-foreground text-center">{searchParams.message}</p>
        )}
      </form>
    </div>
    </div>
  );
}

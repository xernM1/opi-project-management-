import Link from "next/link";

interface DashboardButtonProps {
  userId: string | null;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({ userId }) => {



  return (
    <Link
      className="py-2 px-3 flex rounded-md no-underline hover:bg-btn-background-hover border"
      href={`/dashboard/${userId}`}
      target="_blank"
      rel="noreferrer"
    >
      <svg
        aria-label="Vercel logomark"
        role="img"
        viewBox="0 0 74 64"
        className="h-4 w-4 mr-2"
      >
        <path
          d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z"
          fill="currentColor"
        ></path>
      </svg>
      Dashboard
    </Link>
  );
}
export default DashboardButton
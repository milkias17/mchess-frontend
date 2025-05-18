import { useAuth } from "@/hooks/useAuth";
import type { User } from "@/lib/types";
import axiosClient from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import {
  useParams,
  createRoute,
  type AnyRoute,
  type RootRoute,
} from "@tanstack/react-router";

function UserProfile() {
  // Placeholder data - replace with actual data fetching logic later
  // const user = {
  //   username: "jaminux",
  //   firstName: "Milkias",
  //   lastName: "Yeheyis",
  //   stats: {
  //     gamesPlayed: 1250,
  //     wins: 800,
  //     losses: 300,
  //     draws: 150,
  //     rating: 2800,
  //   },
  // }; // This placeholder is unused, can be removed later

  const loggedInUser = useAuth.use.user();
  const { userId } = useParams({
    from: "/authenticated/user/$userId",
  });

  const games = [
    { id: 1, opponent: "MagnusC", result: "Win", date: "2023-10-26" },
    { id: 2, opponent: "FabianoC", result: "Draw", date: "2023-10-25" },
    { id: 3, opponent: "MaximeV", result: "Loss", date: "2023-10-24" },
    { id: 4, opponent: "HikaruN", result: "Win", date: "2023-10-23" },
    { id: 5, opponent: "DingL", result: "Loss", date: "2023-10-22" },
  ];

  const getResultColor = (result: string) => {
    switch (result) {
      case "Win":
        return "text-success font-bold";
      case "Loss":
        return "text-error font-bold";
      case "Draw":
        return "text-warning font-bold";
      default:
        return "";
    }
  };

  const handleGameClick = (gameId: number) => {
    // Placeholder for navigation or modal opening
    console.log(`Clicked game with ID: ${gameId}`);
    // In a real app, you might navigate like:
    // navigate({ to: '/game/$gameId', params: { gameId: gameId.toString() } });
  };

  const { data, isLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axiosClient.get<User>(`/user/${userId}`);
      return res.data;
    },
    enabled: !!loggedInUser?.userId,
  });

  // Optional: Add loading state UI
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">Loading profile...</div>
    );
  }

  // Optional: Add error/no data state UI
  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        Could not load user profile.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header Section */}
      <div className="hero bg-base-200 rounded-box mb-8">
        {/* Adjusted hero-content layout for better alignment */}
        <div className="hero-content flex-col lg:flex-row w-full justify-center lg:justify-start">
          <div className="avatar online mb-4 lg:mb-0 lg:mr-8">
            {" "}
            {/* Added margin */}
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <div className="avatar avatar-placeholder">
                <div className="bg-neutral text-neutral-content w-24 rounded-full">
                  <span className="text-3xl">{data.username.charAt(0)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-start">
            <h1 className="text-5xl font-bold">{data.username}</h1>
            <p className="text-lg mt-2">
              {data.first_name} {data.last_name}
            </p>
            {/* Added email address */}
            {data.email && ( // Only display if email exists
              <p className="text-md text-gray-600 mt-1">{data.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Statistics</h2>
          {/* Using fetched data for stats if available */}
          {/* Note: The placeholder `user.stats` is still used below. */}
          {/* You will need to update your backend or data fetching to provide these stats in 'data' */}
          <div className="stats shadow w-full">
            <div className="stat place-items-center">
              <div className="stat-title">Games Played</div>
              <div className="stat-value">
                {/* Replace with data.stats.gamesPlayed */}
                {/* {data?.stats?.gamesPlayed || user.stats.gamesPlayed} */}
                {/* Using placeholder for now */}
                1250
              </div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Wins</div>
              <div className="stat-value text-success">
                {/* Replace with data.stats.wins */}
                {/* {data?.stats?.wins || user.stats.wins} */}
                800
              </div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Losses</div>
              <div className="stat-value text-error">
                {/* Replace with data.stats.losses */}
                {/* {data?.stats?.losses || user.stats.losses} */}
                300
              </div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Draws</div>
              <div className="stat-value text-warning">
                {/* Replace with data.stats.draws */}
                {/* {data?.stats?.draws || user.stats.draws} */}
                150
              </div>
            </div>

            {/* Rating stat (commented out in original) */}
            {/* Assuming rating might be part of the data.stats */}
            {/* {data?.stats?.rating && (
              <div className="stat place-items-center">
                <div className="stat-title">Rating</div>
                 <div className="stat-value">{data.stats.rating}</div>
              </div>
            )} */}
          </div>
        </div>
      </div>

      {/* Recent Games Section */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Recent Games</h2>
          {games.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full table-zebra table-compact">
                <thead>
                  <tr>
                    <th>Opponent</th>
                    <th>Result</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {games.map((game) => (
                    <tr
                      key={game.id}
                      className="hover:cursor-pointer"
                      onClick={() => handleGameClick(game.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleGameClick(game.id);
                        }
                      }}
                      tabIndex={0}
                    >
                      <td>{game.opponent}</td>
                      <td className={getResultColor(game.result)}>
                        {game.result}
                      </td>
                      <td>{game.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-600">No recent games played.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default (parentRoute: AnyRoute) =>
  createRoute({
    path: "/user/$userId",
    component: UserProfile,
    getParentRoute: () => parentRoute,
  });

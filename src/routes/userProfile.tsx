import { useAuth } from "@/hooks/useAuth";
import type { GameEntity, GameStats, User } from "@/lib/types";
import axiosClient from "@/lib/apiClient";
import { useQuery } from "@tanstack/react-query";
import {
  useParams,
  createRoute,
  type AnyRoute,
  useNavigate,
} from "@tanstack/react-router";
import Loading from "@/components/Loading";
import ErrorDisplay from "@/components/Error";

function getResult(outcome: string | null, isWhite: boolean) {
  switch (outcome) {
    case "1-0":
      return isWhite ? "Win" : "Loss";
    case "0-1":
      return isWhite ? "Loss" : "Win";
    case "1/2-1/2":
      return "Draw";
    default:
      return "Unknown";
  }
}

function UserProfile() {
  const loggedInUser = useAuth.use.user();
  const { userId } = useParams({
    from: "/authenticated/user/$userId",
  });

  const navigate = useNavigate();

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

  const handleGameClick = (gameId: string) => {
    navigate({
      to: "/completed-game/$gameId",
      params: {
        gameId,
      },
    });
  };

  const { data: userData, isLoading: userInfoLoading } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await axiosClient.get<User>(`/user/${userId}`);
      return res.data;
    },
    enabled: !!loggedInUser?.userId,
  });

  const { data: gameStats, isLoading: gameStatsLoading } = useQuery({
    queryKey: ["game-stats"],
    queryFn: async () => {
      const res = await axiosClient.get<GameStats>(
        `/user/${userId}/game-stats`,
      );
      return res.data;
    },
    enabled: !!loggedInUser?.userId,
  });

  const { data: userGames, isLoading: userGamesLoading } = useQuery({
    queryKey: ["user-games"],
    queryFn: async () => {
      const res = await axiosClient.get<GameEntity[]>(`/user/${userId}/games`);
      return res.data;
    },
    enabled: !!loggedInUser?.userId,
  });

  if (userInfoLoading || gameStatsLoading || userGamesLoading) {
    return <Loading />;
  }

  if (userData == null || gameStats == null || userGames == null) {
    return <ErrorDisplay message="Could not load user profile." />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="hero bg-base-200 rounded-box mb-8">
        <div className="hero-content flex-col lg:flex-row w-full justify-center lg:justify-start">
          <div className="avatar online mb-4 lg:mb-0 lg:mr-8">
            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
              <div className="avatar avatar-placeholder">
                <div className="bg-neutral text-neutral-content w-24 rounded-full">
                  <span className="text-3xl">
                    {userData.username.charAt(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center lg:items-start">
            <h1 className="text-5xl font-bold">{userData.username}</h1>
            <p className="text-lg mt-2">
              {userData.first_name} {userData.last_name}
            </p>
            {userData.email && ( // Only display if email exists
              <p className="text-md text-gray-600 mt-1">{userData.email}</p>
            )}
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-4">Statistics</h2>
          <div className="stats stats-vertical sm:stats-horizontal shadow w-full">
            <div className="stat place-items-center">
              <div className="stat-title">Games Played</div>
              <div className="stat-value">
                {gameStats.draws + gameStats.wins + gameStats.losses}
              </div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Wins</div>
              <div className="stat-value text-success">{gameStats.wins}</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Losses</div>
              <div className="stat-value text-error">{gameStats.losses}</div>
            </div>

            <div className="stat place-items-center">
              <div className="stat-title">Draws</div>
              <div className="stat-value text-warning">{gameStats.draws}</div>
            </div>
          </div>
        </div>
      </div>

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
                  {userGames.map((game) => (
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
                      <td>
                        {game.white_user_id === userId
                          ? game.black_username
                          : game.white_username}
                      </td>
                      <td
                        className={getResultColor(
                          getResult(game.winner, game.white_user_id === userId),
                        )}
                      >
                        {getResult(game.winner, game.white_user_id === userId)}
                      </td>
                      <td>{new Date(game.created_at).toLocaleDateString()}</td>
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

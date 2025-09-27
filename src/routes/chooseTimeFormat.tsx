import Loading from "@/components/Loading";
import axiosClient from "@/lib/apiClient";
import { router } from "@/main";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createRoute,
  useNavigate,
  useSearch,
  type AnyRoute,
  type RootRoute,
} from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import type { LiveGame } from "@/lib/types";

const timeFormats = [
  "1+0",
  "1+1",
  "2+1",
  "3+0",
  "3+2",
  "5+0",
  "5+3",
  "10+0",
  "10+5",
  "15+10",
  "30+0",
  "60+0",
  "60+30",
  "90+30",
  "120+0",
];

function CreateGameButton({ timeFormat }: { timeFormat: string }) {
  const navigate = useNavigate();
  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const res = await axiosClient.post<LiveGame>("/game/live", {
        time_format: timeFormat,
      });
      return res.data;
    },
    onSuccess: (data) => {
      console.log(data.id);
      navigate({
        to: "/online-game/$gameId",
        params: {
          gameId: data.id,
        },
      });
    },
  });

  if (isPending) {
    return (
      <button type="button" className="btn btn-info btn-soft">
        <span className="loading loading-spinner" />
      </button>
    );
  }

  return (
    <button
      type="button"
      className="btn btn-info btn-soft"
      onClick={() => mutate()}
    >
      {timeFormat}
    </button>
  );
}

function ChooseTimeFormat() {
  const { gameType } = useSearch({
    from: "/choose-time",
  });

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 lg:justify-around my-10 mx-4">
      <img
        src="/chess-board.png"
        alt="Chessboard"
        className="aspect-square"
      />
      <div className="flex flex-col h-[1000px] lg:h-auto justify-around gap-4 lg:gap-8 p-8 xl:p-24 bg-neutral rounded-lg">
        <h2 className="text-3xl font-bold text-center">
          Choose the time format
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {gameType === "offline" &&
            timeFormats.map((tf) => (
              <Link
                to="/game"
                search={{
                  timeFormat: tf,
                }}
                key={tf}
                className="btn btn-info btn-soft"
              >
                {tf}
              </Link>
            ))}
          {gameType === "online" &&
            timeFormats.map((tf, i) => (
              <CreateGameButton timeFormat={tf} key={tf} />
            ))}
        </div>
      </div>
    </div>
  );
}

type GameType = {
  gameType: "offline" | "online";
};
export default (parentRoute: AnyRoute) =>
  createRoute({
    path: "/choose-time",
    component: ChooseTimeFormat,
    getParentRoute: () => parentRoute,
    validateSearch: (search): GameType => {
      const gameType = search?.gameType as string | undefined;
      return {
        gameType: gameType === "online" ? "online" : "offline",
      };
    },
  });

import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Redirect({ to }: any) {
	const router = useRouter();

	useEffect(() => {
        if (router.isReady) {
		    router.push(to);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [to, router.isReady]);
	return null;
}
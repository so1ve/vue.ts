import { defineComponent } from "vue";

interface Props<T> {
	a: number;
	b: {
		some: boolean;
	};
}

export default defineComponent(<T,>(props: Props<T>) => {
	return () => <div>{props}</div>;
});

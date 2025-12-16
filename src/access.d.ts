/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: {
    currentUser?: API.CurrentUser;
} | undefined): {
    canAdmin: boolean | undefined;
};

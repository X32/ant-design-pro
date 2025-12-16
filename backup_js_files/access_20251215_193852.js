/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState) {
    const { currentUser } = initialState ?? {};
    return {
        canAdmin: currentUser && currentUser.access === 'admin',
    };
}

export const useSessionStorage = () => {
  const [values, setValues] = useState({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {}, deps ? [...deps, query] : []);

  const { loading, data, error } = values;
  return [loading, data, error];
};

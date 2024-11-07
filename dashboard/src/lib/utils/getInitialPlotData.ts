export const get_initial_data = async (
    axis_index: number,
    length: number
  ): Promise<InitialFetchDataInterface> => {
    let ret: Promise<InitialFetchDataInterface> =
      new Promise<InitialFetchDataInterface>((resolve, reject) =>
        resolve({ time_data: null, axis_data: null })
      );

    await timeoutFetch<Array<ROSAxisStateInterface>>(
      `/api/backend/historian/axis/${axis_index}?number_of_points=${length}`,
      5000
    )
      .then((data?) => {
        if (data) {
          let data_documents = new DatabaseROSAxisStateArray(data);
          console.log("Got initial data");

          const time_data = data_documents.documents
            .map((d) => ({
              time: d.stamp.sec + d.stamp.nanosec / 1e9,
            }))
            .reverse();

          const axis_data = data_documents.documents
            .map((d) => ({
              stamp: d.stamp,
              axis_index: axis_index,
              position: d.position,
              velocity: d.velocity,
            }))
            .reverse();

          initial_data_acquired.current = {
            ...initial_data_acquired.current,
            [axis_index]: true,
          };

          ret = new Promise<InitialFetchDataInterface>((resolve, reject) =>
            resolve({ time_data: time_data, axis_data: axis_data })
          );
        }
      })
      .catch((e) => {
        console.error(
          `Error acquiring initial plot data of length ${length} for axis index ${axis_index}: ${e}`
        );

        initial_data_acquired.current = {
          ...initial_data_acquired.current,
          [axis_index]: false,
        };
      });

    return ret;
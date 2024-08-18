
import { useOthers, useSelf, useStatus } from "@liveblocks/react";
import { Avatar } from "./Avatar";
import styles from "./index.module.css";
import { generateRandomName } from "@/lib/utils";
import { useMemo } from "react";





function ActiveUsers() {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;



  
  const memorizedUsers = useMemo(() => {
    return (
      <div className="flex py-2 items-center justify-center">
        <div className="flex -space-x-2">

          {users.slice(0, 3).map(({ connectionId, info }) => {
            return (
              <Avatar key={connectionId} name={generateRandomName()} />
            );
          })}

          {hasMoreUsers && <div className={styles.more}>+{users.length - 3}</div>}

          {currentUser && (
            <div className="relative ml-8 first:ml-0">
              <Avatar name="You" />
            </div>
          )}

        </div>
      </div>
    )
  }, [currentUser?.connectionId,users.length])

  return memorizedUsers
}

export default ActiveUsers

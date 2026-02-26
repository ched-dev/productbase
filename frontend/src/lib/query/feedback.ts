import { usePbClient } from "@/lib/pb/client";
import { PBData, PBDataList } from "../pb";

const pb = usePbClient();

export async function getUsersFeedback() {
  // List response returns `ListResult<RecordModel>`
  const resultList = await pb.collection('users').getList(1, 50, {
    expand: 'user_feedback_via_user,user_feedback_via_user.feedback_actions',
  });

  const userList = new PBDataList(resultList)
  const user = userList.last
  console.log('user', user)
  console.log('user_feedback', user?.user_feedback)

  // List response with sorting after
  const actionsList = new PBDataList(await pb.collection('feedback_actions').getList())
  actionsList.sort('action,-created')
  console.log('actionsList.items', actionsList.items)

  // Single record
  const record = await pb.collection('user_feedback').getOne('7z013ws4h3ci3pv', {
    expand: 'feedback_actions',
  })
  const recordData = new PBData(record)
  recordData.sortProperty('feedback_actions', 'created')
  console.log('recordData', recordData)
  console.log('feedback_actions', recordData.feedback_actions)
}

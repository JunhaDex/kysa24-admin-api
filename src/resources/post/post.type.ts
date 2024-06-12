export interface PostDAO {
  id: number;
  author: number;
  authorRef: string;
  authorName: string;
  image: string;
  message: string;
  groupId: number;
  groupRef: string;
  groupName: string;
  createdAt: Date;
  updatedAt: Date;
}

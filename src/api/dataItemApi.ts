import { query, where, addDoc, doc, getDocs, setDoc, deleteDoc } from '@firebase/firestore';
import { collectionDataFirebase } from '../firebaseConfig';
import { DataItemInterface, DataItemInterfaceWithId } from '../typesInterfaces/dataItem';
import { useContext, useState } from 'react';
import { DataContext } from '../hooks/dataContext';
import { AuthContext } from '../hooks/authContext';
import { imagesApiService } from './imagesApi';
import { useSearchParams } from 'react-router-dom';

export function dataItemApiService() {
  const { user } = useContext(AuthContext);
  const { dataStore, setDataStore } = useContext(DataContext);
  const { addImage } = imagesApiService();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { removeImage } = imagesApiService();

  const validUsers = [user?.email, searchParams.get('userEmail')].filter(userValue => !!userValue);

  const parseImageId = async (data: DataItemInterface | DataItemInterfaceWithId) => {
    if (!user?.email) return data;

    // image removed from existing data
    if ('id' in data) {
      const oldData = (dataStore|| []).find((dataItem) => dataItem.id === data.id);
      if (!data.image && oldData?.image) {
        await removeImage(oldData?.image);
        return data;
      }
    }

    if (data.image) {
      const imageId = await addImage({ dataImage: data.image, userEmail: user.email });
      if (imageId && typeof imageId === 'string') {
        data.image = imageId;
      }
    }

    if (!data.image) delete data.image;
    return data;
  }

  const getDataItems = async () => {

    if (!validUsers.length) {
      setDataStore(undefined);
      return true;
    }

    setLoading(true);
    const docs = query(collectionDataFirebase, where('userEmail', 'in', validUsers));
    return await getDocs(docs)
      .then((querySnapshot) => {
        const nextDataStore: DataItemInterfaceWithId[] = [];
        querySnapshot.forEach((doc) => {

          const data: DataItemInterface = doc.data() as DataItemInterface;
          const dataWithId: DataItemInterfaceWithId = { ...data, id: doc.id };
          nextDataStore.push(dataWithId);
        });
        setDataStore(nextDataStore);
      })
      .catch(() => {
        return false;
      }).finally(() => {
        setLoading(false);
      });
  }

  const addDataItem = async (data: DataItemInterface) => {
    if (!user?.email) return false;

    const dataParsed = await parseImageId(data);

    setLoading(true);
    return await addDoc(collectionDataFirebase, dataParsed)
      .then((doc) => {
        const nextDataItemWithId: DataItemInterfaceWithId = { ...dataParsed, id: doc.id };
        setDataStore((dataStore || []).concat([nextDataItemWithId]));
        return true;
      })
      .catch(() => {
        return false;
      }).finally(() => {
        setLoading(false);
      });
  }

  const removeDataItemImage = async (idImage: string) => {
    await removeImage(idImage);
  }

  const removeDataItem = async (id: string, idImage?: string) => {
    if (idImage) await removeDataItemImage(idImage);

    return await deleteDoc(doc(collectionDataFirebase, id))
      .then(() => {
        const nextDataItemStore = (dataStore || []).filter((item: DataItemInterfaceWithId) => item.id !== id);
        setDataStore(nextDataItemStore);
        return true;
      })
      .catch(() => {
        return false;
      }).finally(() => {
        setLoading(false);
      });
  }

  const updateDataItem = async (data: DataItemInterfaceWithId) => {
    setLoading(true);

    await parseImageId(data);

    return await setDoc(
      doc(collectionDataFirebase, data.id),
      data,
      { merge: false },
    )
      .then(() => {
        const nextDataStore = (dataStore || []).map((dataItem) => dataItem.id === data.id ? data : dataItem);
        setDataStore(nextDataStore);
        return true;
      })
      .catch(() => {
        return false;
      }).finally(() => {
        setLoading(false);
      });
  }

  return { loading, getDataItems, addDataItem, removeDataItem, removeDataItemImage, updateDataItem };
}

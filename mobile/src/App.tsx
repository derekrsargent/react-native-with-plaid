import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { PlaidLink } from 'react-native-plaid-link-sdk';
import { getValueFor, save } from './utils';
import { type Account } from './types';

function App() {
  const ACCESS_TOKEN_KEY = 'access-token-key';

  const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';
  const port = 8000;

  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [hasAccessToken, setHasAccessToken] = useState(false);
  const [balance, setBalance] = useState(null);

  const createLinkToken = useCallback(async () => {
    await fetch(`http://${address}:${port}/api/create_link_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(data => {
        setLinkToken(data.link_token);
      })
      .catch(err => {
        // TODO - Error Handling
        console.log(err);
      });
  }, [address, setLinkToken]);

  const getBalance = useCallback(
    async (accessToken: string) => {
      await fetch(`http://${address}:${port}/api/balance`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          access_token: accessToken,
        },
      })
        .then(response => response.json())
        .then(data => {
          setBalance(data.accounts);
        })
        .catch(err => {
          console.log(err);
        });
    },
    [address],
  );

  useEffect(() => {
    if (linkToken === null) {
      createLinkToken();
    }
  }, [createLinkToken, linkToken]);

  useEffect(() => {
    async function fetchMyAPI() {
      const result = await getValueFor(ACCESS_TOKEN_KEY);
      if (result) {
        setHasAccessToken(true);
      }
    }

    fetchMyAPI();
  }, []);

  useEffect(() => {
    async function fetchMyAPI() {
      const accessToken = await getValueFor(ACCESS_TOKEN_KEY);
      if (accessToken) {
        getBalance(accessToken);
      }
    }

    if (hasAccessToken) {
      fetchMyAPI();
    }
  }, [getBalance, hasAccessToken]);

  const renderItem = ({ item }: { item: Account }) => {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <View style={styles.type}>
            <View>
              <Text style={styles.headerText}>Account Name</Text>
              <Text style={styles.text}>{item.name}</Text>
            </View>

            <View>
              <Text style={styles.headerText}>Type</Text>
              <Text style={styles.text}>{item.subtype}</Text>
            </View>
          </View>

          <View style={styles.available}>
            <Text style={(styles.headerText, { fontSize: 30 })}>
              ${item.balances?.available}
            </Text>

            <Text style={styles.text}>Current: ${item.balances?.current}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {!hasAccessToken ? (
        <PlaidLink
          tokenConfig={{
            token: linkToken ?? '',
            noLoadingState: false,
          }}
          onSuccess={async success => {
            await fetch(`http://${address}:${port}/api/set_access_token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ public_token: success.publicToken }),
            })
              .then(response => response.json())
              .then(data => {
                save(ACCESS_TOKEN_KEY, data.access_token);
                setHasAccessToken(true);
              })
              .catch(err => {
                // TODO - Error Handling
                console.log(err);
              });
          }}
          onExit={response => {
            console.log(response);
          }}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>Launch Wallet</Text>
          </View>
        </PlaidLink>
      ) : (
        <>
          <Text style={styles.title}>Account Balances</Text>
          <FlatList
            data={balance}
            renderItem={renderItem}
            keyExtractor={item => item.account_id}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 15,
    backgroundColor: '#42b883',
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 20,
  },
  container: {
    flex: 1,
    marginTop: 30,
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  itemContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    backgroundColor: '#1E1E2D',
    borderRadius: 10,
    height: 100,
  },
  title: {
    fontWeight: '700',
    fontSize: 32,
    marginVertical: 16,
  },
  textView: {
    flexDirection: 'column',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
  text: {
    color: '#1E1E2D',
    fontSize: 14,
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E1E2D',
  },
  icon: {
    width: 20,
    height: 20,
    marginBottom: 5,
  },
  cardContainer: {
    width: 200,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 20,
    height: 100,
  },
  card: {
    flexDirection: 'column',
    height: '100%',
  },
  gradientCard: {
    height: 150,
    width: '100%',
  },
  available: {
    flexDirection: 'column',
    paddingHorizontal: 10,
    height: '70%',
  },
  type: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '30%',
    paddingHorizontal: 10,
  },
});

export default App;

import React, { useCallback, useEffect, useState } from 'react';
import { Platform, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { PlaidLink } from 'react-native-plaid-link-sdk';

function App() {
  const address = Platform.OS === 'ios' ? 'localhost' : '10.0.2.2';
  const [linkToken, setLinkToken] = useState(null);

  const createLinkToken = useCallback(async () => {
    await fetch(`http://${address}:8000/api/create_link_token`, {
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
        console.log(err);
      });
  }, [address, setLinkToken]);

  useEffect(() => {
    console.log(linkToken);
    if (linkToken == null) {
      createLinkToken();
    }
  }, [createLinkToken, linkToken]);

  return (
    <SafeAreaView style={styles.container}>
      <PlaidLink
        tokenConfig={{
          token: linkToken ?? '',
          noLoadingState: false,
        }}
        onSuccess={async success => {
          await fetch(`http://${address}:8080/api/set_access_token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ public_token: success.publicToken }),
          })
            .then(response => response.json())
            .then(data => {
              // dispatch({
              //   type: 'SET_STATE',
              //   accessToken: data.access_token,
              //   itemId: data.item_id,
              // });
              console.log(data);
            })
            .catch(err => {
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
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
